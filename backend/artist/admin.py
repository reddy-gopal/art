from django.contrib import admin
from .models import Post, SavePost, LikePost, Comment, Follow, CustomUser

admin.site.register(CustomUser)
admin.site.register(Post)
admin.site.register(SavePost)
admin.site.register(LikePost)
admin.site.register(Comment)
admin.site.register(Follow)