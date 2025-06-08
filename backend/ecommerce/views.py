from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Cart, CartItem, Order, OrderItem, Address
from artist.models import Post
from .serializers import *

class AddToCartView(generics.CreateAPIView):
    serializer_class = AddCartItemSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        post = serializer.validated_data['post']
        quantity = serializer.validated_data['quantity']

        if post.is_sold:
            raise serializers.ValidationError("Artwork is already sold")

        cart, _ = Cart.objects.get_or_create(user=self.request.user)
        cart_item, created = CartItem.objects.get_or_create(cart=cart, post=post)

        if not created:
            cart_item.quantity += quantity
        else:
            cart_item.quantity = quantity

        cart_item.save()

# View Cart
class CartDetailView(generics.RetrieveAPIView):
    serializer_class = CartItemSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        items = cart.items.select_related('post')
        serializer = CartItemSerializer(items, many=True)
        return Response({'cart': serializer.data})

# Remove from Cart
class RemoveFromCartView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        post_id = request.data.get('post_id')
        cart = Cart.objects.get(user=request.user)
        CartItem.objects.filter(cart=cart, post_id=post_id).delete()
        return Response({'message': 'Removed from cart'})

# Checkout
class CheckoutView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart = Cart.objects.get(user=request.user)
        items = cart.items.select_related('post')

        if not items:
            return Response({'error': 'Cart is empty'}, status=400)

        total = sum([item.get_total_price() for item in items])
        order = Order.objects.create(user=request.user, total_amount=total)

        for item in items:
            OrderItem.objects.create(
                order=order,
                post=item.post,
                price=item.post.price,
                quantity=item.quantity
            )
            item.post.is_sold = True
            item.post.save()

        cart.items.all().delete()
        serializer = OrderSerializer(order)
        return Response({'order': serializer.data}, status=201)

# List Orders
class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).prefetch_related('items__post')

# Add Address
class AddressCreateView(generics.CreateAPIView):
    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
