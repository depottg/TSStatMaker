# Generated by Django 2.0.4 on 2019-07-05 15:27

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('StatViz', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='task',
            name='tags',
            field=models.CharField(default='', max_length=1024),
        ),
    ]
