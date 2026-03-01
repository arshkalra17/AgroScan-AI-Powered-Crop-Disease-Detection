"use client"

import { Button } from "@/components/ui/button"
import { ShoppingCart, Trash2 } from "lucide-react"
import { useCart } from "../CartContext"

export default function Cart() {
  const { cartItems, removeFromCart, clearCart } = useCart();

  return (
    <div className="container mx-auto py-8 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-primary">Shopping Cart</h1>
        {cartItems.length > 0 && (
          <Button variant="outline" onClick={clearCart} className="text-red-600 hover:bg-red-100">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        )}
      </div>
      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-lg text-muted-foreground">Your cart is empty.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.href = '/marketplace'}
          >
            Continue Shopping
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {cartItems.map(item => (
            <li key={item.id} className="flex justify-between items-center py-4">
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-col flex-1">
                  <span className="text-lg font-medium">{item.name}</span>
                  <span className="text-sm text-muted-foreground">Quantity: {item.quantity || 1}</span>
                  <span className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} each</span>
                </div>
                <span className="text-lg font-semibold text-primary text-right">₹{(item.price * (item.quantity || 1)).toFixed(2)}</span>
              </div>
              <Button variant="outline" onClick={() => removeFromCart(item.id)} className="text-red-600 hover:bg-red-100 ml-4">
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
      {cartItems.length > 0 && (
        <>
          <div className="mt-6 border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg">Subtotal:</span>
              <span className="text-lg">₹{cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-primary">Total:</span>
              <span className="text-xl font-bold text-primary">₹{cartItems.reduce((total, item) => total + (item.price * (item.quantity || 1)), 0).toFixed(2)}</span>
            </div>
          </div>
          <Button 
            variant="primary" 
            className="mt-6 w-full py-3 rounded-lg shadow-lg hover:shadow-xl transition duration-200 transform hover:scale-105 bg-gradient-to-r from-primary to-secondary text-white font-semibold"
            onClick={() => window.location.href = '/marketplace/checkout'}
          >
            Proceed to Checkout
          </Button>
        </>
      )}
    </div>
  )
} 