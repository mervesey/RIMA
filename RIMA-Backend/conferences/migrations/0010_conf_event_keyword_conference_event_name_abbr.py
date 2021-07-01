# Generated by Django 2.2.3 on 2021-07-01 09:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('conferences', '0009_event_has_keyword'),
    ]

    operations = [
        migrations.AddField(
            model_name='conf_event_keyword',
            name='conference_event_name_abbr',
            field=models.ManyToManyField(through='conferences.Event_has_keyword', to='conferences.Conference_Event'),
        ),
    ]
