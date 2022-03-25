import frontmatter
import io
import os
import json
import glob

# Where are the files to modify
post_path = "posts/*.md"

# Where to store posts
out_path = "assets/"

# summart.json is about individual blogs
post_metadatas = []

# Loop through all files
for fpath in glob.glob(post_path):
    fname = os.path.splitext(os.path.split(fpath)[1])[0]
    with io.open(fpath, 'r') as f:
        # Parse file's front matter
        post = frontmatter.load(f)
        # you can use post.get() to access attributes
        # use post.metadata to get a dict about metadata
        # use post.content to get content(str)
        # <!-- more --> to generate a description
        post_metadatas.append({'title': post.get('title'),'data': post.get('date'),'tags': post.get('tags'),'url':fname})

# so you get summary! 
summary_file = io.open(out_path + "summary.json", 'w', encoding='utf8')
summary_file.write(json.dumps(post_metadatas, default=str, ensure_ascii=False))
summary_file.close()

print('success')
