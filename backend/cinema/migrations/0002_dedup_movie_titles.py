# backend/cinema/migrations/0003_dedup_movie_titles.py
from django.db import migrations

def dedup_titles(apps, schema_editor):
    Movie = apps.get_model('cinema', 'Movie')
    seen = {}
    to_delete = []

    # Mantém o primeiro id de cada title "normalizado" e remove os demais
    for m in Movie.objects.all().order_by('id'):
        key = (m.title or '').strip().lower()
        if not key:
            continue
        if key in seen:
            to_delete.append(m.id)
        else:
            seen[key] = m.id

    if to_delete:
        Movie.objects.filter(id__in=to_delete).delete()

class Migration(migrations.Migration):

    dependencies = [
        ('cinema', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(dedup_titles, migrations.RunPython.noop),
    ]
