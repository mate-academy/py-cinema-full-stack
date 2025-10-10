# backend/cinema/migrations/0003_alter_movie_title_unique.py
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        # Depende da limpeza para evitar falha ao aplicar o unique
        ('cinema', '0002_dedup_movie_titles'),
    ]

    operations = [
        migrations.AlterField(
            model_name='movie',
            name='title',
            field=models.CharField(max_length=255, unique=True),
        ),
    ]
