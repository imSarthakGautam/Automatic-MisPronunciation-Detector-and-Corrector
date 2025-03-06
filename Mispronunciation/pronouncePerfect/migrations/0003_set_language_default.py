# Generated by Django 5.1.4 on 2025-03-04 13:09

def set_existing_languages_to_english(apps, schema_editor):
    PracticeSample = apps.get_model('pronouncePerfect', 'PracticeSample')
    PracticeSample.objects.all().update(language='en')

from django.db import migrations
class Migration(migrations.Migration):

    dependencies = [
        ('pronouncePerfect', '0002_practicesample'),
    ]

    operations = [
        migrations.RunPython(set_existing_languages_to_english),
    ]
