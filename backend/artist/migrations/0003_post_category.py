# Generated by Django 5.2.2 on 2025-06-07 18:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('artist', '0002_post_price'),
    ]

    operations = [
        migrations.AddField(
            model_name='post',
            name='category',
            field=models.CharField(choices=[('painting', 'Painting'), ('sculpture', 'Sculpture'), ('photography', 'Photography'), ('digital', 'Digital Art'), ('other', 'Other')], default='other', max_length=20),
        ),
    ]
