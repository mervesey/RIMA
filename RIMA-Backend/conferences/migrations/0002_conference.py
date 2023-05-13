# Generated by Django 2.2.3 on 2021-09-20 13:18

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('conferences', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Conference',
            fields=[
                ('conference_name_abbr', models.CharField(max_length=100, primary_key=True, serialize=False)),
                ('conference_url', models.CharField(blank=True, max_length=1024, null=True)),
                ('platform_name', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conferences', to='conferences.Platform')),
            ],
        ),
    ]