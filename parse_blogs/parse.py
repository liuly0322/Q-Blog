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
# we also need pagination info
details = []


def save_post(name: str, content: str, title: str, date: str):
    # get detail
    detail_index = content.find('<!-- more -->')
    if detail_index == -1:
        detail = content[:100] + '......'
    else:
        detail = content[:detail_index]
    details.append(
        {'detail': detail, 'date': date})

    # get main content
    content_file = io.open(out_post_path + name + '.md', 'w', encoding='utf8')
    content = '# ' + title + '\n\n' + content
    content_file.write(content)
    content_file.close()


# mv pic resources
# todo: this is unsafe
try:
    os.system('rm -r public/posts')
    os.system('mkdir public/posts')
except:
    pass

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
        save_post(fname, post.content, post.get('title'), post.get('date'))
        post_metadatas.append({'title': post.get('title'), 'date': post.get(
            'date'), 'tags': post.get('tags'), 'url': fname})

post_metadatas.sort(key=lambda post: post.get('date'), reverse=True)
details.sort(key=lambda post: post.get('date'), reverse=True)
details = [content.get('detail') for content in details]

# so you get summary!
summary_file = io.open(out_path + "summary.json", 'w', encoding='utf8')
summary_file.write(json.dumps(post_metadatas, default=str, ensure_ascii=False))
summary_file.close()

# so you also need infomation for index
detail_file = io.open(out_path + 'page.json', 'w', encoding='utf8')
detail_file.write(json.dumps(details, default=str, ensure_ascii=False))
detail_file.close()

print('success')
