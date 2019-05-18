# Generated by Django 2.0.4 on 2019-05-17 15:54

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Task',
            fields=[
                ('id', models.CharField(max_length=32, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=128)),
                ('project_name', models.CharField(max_length=128)),
                ('start_date', models.DateField()),
                ('start_time', models.TimeField()),
                ('duration', models.DurationField()),
                ('pause_duration', models.DurationField()),
            ],
        ),
    ]
