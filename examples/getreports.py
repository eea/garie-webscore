#!/usr/bin/env python3

from pathlib import Path

root = Path('/reports')
DOMAINS = [
    "www.eea.europa.eu",
    "www.eionet.europa.eu",
    "svn.eionet.europa.eu",
    "water.europa.eu",
]

assert root.is_dir()

def categories():
    for category in root.iterdir():
        if not category.is_dir():
            continue
        name = category.name
        if name.endswith('-reports') or name.endswith('-results'):
            yield category

def tar_paths():
    for category in categories():
        for domain in DOMAINS:
            domaindir = category / domain
            if not domaindir.is_dir():
                continue
            reports = sorted(domaindir.iterdir(), reverse=True)
            yield from reports[:4]

def main():
    for tp in tar_paths():
        print(tp)


if __name__ == '__main__':
    main()
