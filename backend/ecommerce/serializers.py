from rest_framework import serializers
from .models import CartItem, Cart, Order, OrderItem, Address
from artist.models import Post

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'title', 'price', 'image']

class CartItemSerializer(serializers.ModelSerializer):
    post = PostSerializer()

    class Meta:
        model = CartItem
        fields = ['id', 'post', 'quantity']

class AddCartItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartItem
        fields = ['post', 'quantity']

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        exclude = ['user']

class OrderItemSerializer(serializers.ModelSerializer):
    post = PostSerializer()

    class Meta:
        model = OrderItem
        fields = ['post', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'total_amount', 'created_at', 'items']
