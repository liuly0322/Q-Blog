import frontmatter
import io
import os
import json
import glob

# Where are the files to modify
post_path = "posts/*.md"

# Where to store posts
out_path = "assets/"
out_post_path = "src/pages/posts/"

# summart.json is about individual blogs
post_metadatas = []

def save_post(name: str, content: str, title: str):
    content_file = io.open(out_post_path + name + '.md', 'w', encoding='utf8')
    content = '# ' + title + '\n\n' + content
    content_file.write(content)
    content_file.close()

# mv pic resources
# todo: this is unsafe
os.system('rm -r public/posts')
os.system('mkdir public/posts')
path = os.listdir('posts')
for p in path:
    if os.path.isdir('posts/' + p):
        os.system('cp -a posts/{}/. public/posts'.format(p))

# Loop through all files
for fpath in glob.glob(post_path):
    fname = os.path.splitext(os.path.split(fpath)[1])[0]
    with io.open(fpath, 'r') as f:
        # Parse file's front matter
        post = frontmatter.load(f)
        # you can use post.get() to access attributes
        # use post.metadata to get a dict about metadata
        # use post.content to get content(str)
        save_post(fname, post.content, post.get('title'))
        # <!-- more --> to generate a description
        post_metadatas.append({'title': post.get('title'),'date': post.get('date'),'tags': post.get('tags'),'url':fname})

post_metadatas.sort(key=lambda post: post.get('date'), reverse=True)

# so you get summary! 
summary_file = io.open(out_path + "summary.json", 'w', encoding='utf8')
summary_file.write(json.dumps(post_metadatas, default=str, ensure_ascii=False))
summary_file.close()

print('success')
