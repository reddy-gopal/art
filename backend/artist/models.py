from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    bio = models.TextField(blank=True, null=True)
    profile_picture = models.ImageField(upload_to='profiles/', blank=True, null=True)
    def __str__(self):
        return self.username


class Post(models.Model):

    CATEGORY_CHOICES = [
        ('painting', 'Painting'),
        ('sculpture', 'Sculpture'),
        ('photography', 'Photography'),
        ('digital', 'Digital Art'),
        ('other', 'Other'),
    ]

    title = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField()
    image = models.ImageField(upload_to='posts/', blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null= True)
    is_sold = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)

    def __str__(self):
        return self.title
    

class SavePost(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='saved_by_users')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='saved_posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('post', 'user')

    def __str__(self):
        return self.post.title

class LikePost(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='liked_by_users')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='liked_posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('post', 'user')
        
    def __str__(self):
        return self.post.title

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comment_by_users')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.content

class Follow(models.Model):
    follower = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='following')
    following = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='followers')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"


class UserActivity(models.Model):
    ACTION_TYPES = [
        ('post', 'Created Post'),
        ('comment', 'Commented'),
        ('like', 'Liked'),
        ('save', 'Saved Post'),
        ('follow', 'Followed User'),
    ]

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='activities')
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    target_post = models.ForeignKey(Post, null=True, blank=True, on_delete=models.CASCADE)
    target_user = models.ForeignKey(CustomUser, null=True, blank=True, on_delete=models.CASCADE, related_name='targeted_activities')
    timestamp = models.DateTimeField(auto_now_add=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.user.username} {self.action_type} at {self.timestamp}"


