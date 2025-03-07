# Generated by Django 2.2.3 on 2023-04-30 20:22

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('interests', '0023_keyword_original_keywords_with_weights'),
    ]

    operations = [
        migrations.CreateModel(
            name='Author',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('author_id', models.CharField(max_length=1024, unique=True)),
                ('name', models.CharField(max_length=1024)),
                ('interests_generated', models.BooleanField(default=False)),
            ],
        ),
        migrations.RemoveField(
            model_name='paper',
            name='updated_on',
        ),
        migrations.AlterField(
            model_name='paper',
            name='paper_id',
            field=models.CharField(default=uuid.uuid4, max_length=255, unique=True),
        ),
        migrations.RemoveField(
            model_name='paper',
            name='user',
        ),
        migrations.AddField(
            model_name='paper',
            name='user',
            field=models.ManyToManyField(related_name='papers', to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='Keyword_Paper',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('weight', models.FloatField(default=1)),
                ('keyword', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='keyword_papers', to='interests.Keyword')),
                ('paper', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='paper_keywords', to='interests.Paper')),
            ],
        ),
        migrations.CreateModel(
            name='Citation',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('relation', models.CharField(choices=[('CITED_BY', 'CITED_BY'), ('REFERENCES', 'REFERENCES')], max_length=512)),
                ('value', models.IntegerField()),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='author_citations', to='interests.Author')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='citations', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='AuthorsInterests',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('weight', models.FloatField(default=1)),
                ('Keyword', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='authors_keyword_interests', to='interests.Keyword')),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='authors_interests', to='interests.Author')),
                ('paper', models.ManyToManyField(related_name='authors_paper_interests', to='interests.Paper')),
            ],
        ),
        migrations.AddField(
            model_name='paper',
            name='author',
            field=models.ManyToManyField(related_name='authors_papers', to='interests.Author'),
        ),
        migrations.CreateModel(
            name='user_blacklisted_paper',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('paper_id', models.CharField(max_length=255)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='blacklisted_papers', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'paper_id')},
            },
        ),
    ]
