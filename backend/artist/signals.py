from django.db.models.signals import post_save, m2m_changed
from django.dispatch import receiver
from .models import Post, Comment, SavePost, UserActivity, LikePost, Follow
from django.contrib.auth import get_user_model

User = get_user_model()
@receiver(post_save, sender=Post)
def create_post_activity(sender, instance, created, **kwargs):
    if created:
        UserActivity.objects.create(
            user=instance.user,
            action_type='post',
            target_post=instance,
            description=f"Created post '{instance.title}'"
        )

@receiver(post_save, sender=Comment)
def create_comment_activity(sender, instance, created, **kwargs):
    if created:
        UserActivity.objects.create(
            user=instance.user,
            action_type='comment',
            target_post=instance.post,
            description=f"Commented: {instance.content[:50]}"
        )

@receiver(post_save, sender=LikePost)
def create_like_activity(sender, instance, created, **kwargs):
    if created:
        UserActivity.objects.create(
            user=instance.user,
            action_type='like',
            target_post=instance.post,
            description=f"Liked post '{instance.post.title}'"
        )

@receiver(post_save, sender=SavePost)
def create_savepost_activity(sender, instance, created, **kwargs):
    if created:
        UserActivity.objects.create(
            user=instance.user,
            action_type='save',
            target_post=instance.post,
            description=f"Saved post '{instance.post.title}'"
        )

@receiver(m2m_changed, sender=Follow)
def create_follow_activity(sender, instance, action, pk_set, **kwargs):
    if action == 'post_add':
        from .models import UserActivity
        for follower_pk in pk_set:
            follower = User.objects.get(pk=follower_pk)
            UserActivity.objects.create(
                user=follower,
                action_type='follow',
                target_user=instance,
                description=f"Followed user {instance.username}"
            )