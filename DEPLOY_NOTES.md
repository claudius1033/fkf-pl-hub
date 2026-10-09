# FKF PL Hub: how the site is run

Live site: https://fkf-pl-hub.vercel.app
GitHub: https://github.com/claudius1033/fkf-pl-hub (account claudius1033)
Database: Supabase project "FKF PL" (ref qmaybtoqrerogxwubhwh)
Local folder: C:\Users\claud\Desktop\fkf_hub

## Update the site (VS Code terminal, Ctrl+`)
    git add .
    git commit -m "describe your change"
    git push
Vercel redeploys by itself in about a minute.

## Go back to an older version
    git log --oneline          (find the version code, e.g. f0eb3ea)
    git checkout f0eb3ea -- index.html
    git commit -am "restore old version"
    git push

## Never upload
- seed_league_hub.py (holds the service_role key)
- backup folders and .csv files
These are listed in .gitignore. Don't remove them from it.

## Security setup (done)
- Admin sign-in with Supabase Auth; only the admin user id can write league data.
- Visitors can only read. Fantasy teams are changed only through the 6 database functions.
- PIN hashes are not publicly readable.

## Before each match day
- Enter results only after a match is live or finished (Admin login > Enter result).
