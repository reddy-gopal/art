from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Cart, CartItem, Order, OrderItem, Address
from artist.models import Post
from .serializers import *
from django.db import transaction

class AddToCartView(generics.CreateAPIView):
    serializer_class = AddCartItemSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        post_id = request.data.get('post')
        try:
            post = Post.objects.get(id=post_id)
            if post.is_sold:
                return Response(
                    {"error": "This artwork has already been sold"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            cart, _ = Cart.objects.get_or_create(user=request.user)
            cart_item, created = CartItem.objects.get_or_create(cart=cart, post=post)
            
            if not created:
                cart_item.quantity += 1
            else:
                cart_item.quantity = 1
            
            cart_item.save()
            
            cart_items = cart.items.all()
            serializer = CartItemSerializer(cart_items, many=True)
            return Response({
                "message": "Added to cart successfully",
                "cart": serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Post.DoesNotExist:
            return Response(
                {"error": "Artwork not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

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
        try:
            cart = Cart.objects.get(user=request.user)
            items = cart.items.select_related('post')

            if not items:
                return Response({'error': 'Cart is empty'}, status=400)

            # Check if any items in the cart are already sold
            sold_items = []
            for item in items:
                if item.post.is_sold:
                    sold_items.append(item.post.title)

            if sold_items:
                return Response({
                    'error': f"The following items have already been sold: {', '.join(sold_items)}",
                    'sold_items': sold_items
                }, status=400)

            # Calculate total and create order
            total = sum([item.get_total_price() for item in items])
            
            # Use transaction to ensure database consistency
            with transaction.atomic():
                # Lock the posts for update to prevent race conditions
                post_ids = [item.post.id for item in items]
                posts = Post.objects.select_for_update().filter(id__in=post_ids)
                
                # Double check if any posts are sold
                if any(post.is_sold for post in posts):
                    return Response({
                        'error': 'Some items in your cart have been sold. Please refresh your cart.'
                    }, status=400)

                # Create order
                order = Order.objects.create(user=request.user, total_amount=total)

                # Create order items and mark posts as sold
                for item in items:
                    OrderItem.objects.create(
                        order=order,
                        post=item.post,
                        price=item.post.price,
                        quantity=item.quantity
                    )
                    item.post.is_sold = True
                    item.post.save()

                # Clear the cart
                cart.items.all().delete()

                serializer = OrderSerializer(order)
                return Response({
                    'message': 'Order placed successfully',
                    'order': serializer.data
                }, status=201)

        except Cart.DoesNotExist:
            return Response({'error': 'Cart not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

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
