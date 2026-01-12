# Cinema Fullstack

- Read [the guideline](https://github.com/mate-academy/py-task-guideline/blob/main/README.md) before start

## Task:

You already have Backend and Frontend implemented.
You need to connect them together, and make sure all functionality of Cinema Shop works.

NOTE: Attach screenshots of all pages from the correctly connected frontend. Better to make them with opened developer tool, where will be shown requests to the API.

To run a project:
```sh
    docker-compose up --build
```

load fixture:
```sh
     docker-compose exec app python manage.py loaddata sample_cinema.json
```

create new user:
```sh
    docker-compose exec app python manage.py createsuperuser
```
