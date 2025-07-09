import os
import shutil


def copytree(src, dst, symlinks=False, ignore=None):
    if not os.path.exists(dst):
        os.mkdir(dst)
    for item in os.listdir(src):
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if os.path.isdir(s):
            if not os.path.exists(d):
                shutil.copytree(s, d, symlinks, ignore)
        else:
            if not os.path.exists(d):
                shutil.copyfile(s, d)


def read_from_file(file):
    file = open(file, "r")
    text = file.read()
    file.close()
    return text
