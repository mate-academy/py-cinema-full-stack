# flake8: noqa
from __future__ import annotations

from django.db import migrations


def deduplicate_titles(apps, schema_editor):
    Movie = apps.get_model("cinema", "Movie")

    # Map: title -> list of ids with that title (ordered by id)
    dup_map = {}
    for m in Movie.objects.all().only("id", "title").order_by("id"):
        dup_map.setdefault(m.title, []).append(m.id)

    # Para cada título duplicado, mantemos o primeiro
    # e renomeamos os demais para títulos únicos previsíveis.
    # Ex.: "Avatar", "Avatar (2)", "Avatar (3)", ...
    for title, ids in dup_map.items():
        if len(ids) <= 1:
            continue

        suffix = 2
        # pula o primeiro id (mantém o título original)
        for movie_id in ids[1:]:
            while True:
                new_title = f"{title} ({suffix})"
                exists = Movie.objects.filter(title=new_title).exists()
                if not exists:
                    break
                suffix += 1

            Movie.objects.filter(id=movie_id).update(title=new_title)
            suffix += 1


class Migration(migrations.Migration):

    dependencies = [
        ("cinema", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(deduplicate_titles, migrations.RunPython.noop),
    ]
