from django.contrib import admin
from .models import AuctionsList, User, Bid,Comments

class CommentsInline(admin.TabularInline):
    model = Comments

class BidsInline(admin.TabularInline):  
    model = Bid

class AuctionsListAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'listed_by', 'bid', 'winner', 'close')
    list_filter = ('category', 'close')
    search_fields = ('title', 'listed_by')
    inlines = [CommentsInline, BidsInline]
    
class CommentsAdmin(admin.ModelAdmin):
    list_display = ('auction', 'username', 'comment')
    search_fields = ('auction__title', 'username')

class BidAdmin(admin.ModelAdmin):
    list_display = ('auction', 'price')
    search_fields = ('auction__title',)

# Register your models here.

admin.site.register(AuctionsList, AuctionsListAdmin)
admin.site.register(User)
admin.site.register(Bid, BidAdmin)
admin.site.register(Comments, CommentsAdmin)