from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required

from .models import AuctionsList, User, Bid, Comments


    

def index(request):
    return render(request, "auctions/index.html",{
        "auctions": AuctionsList.objects.all()
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")
    
@login_required(login_url='login')
def newlisting(request):
    if request.method == "POST":
        title = request.POST.get('title')
        description = request.POST.get('description')
        image = request.FILES.get('image')
        category = request.POST.get('category')
        listed_by = request.user
        bid = request.POST.get('bid')
        
        new_listing = AuctionsList(title=title, description=description, image=image, category=category, listed_by=listed_by, bid = bid)
        new_listing.save()
        
        return HttpResponseRedirect(reverse("index"))
    return render(request, "auctions/newlisting.html")



@login_required(login_url='login')
def listing(request, auction_id):
    listing = AuctionsList.objects.get(pk = auction_id)
    comments = listing.comment.all()
    global watchlist_list
    watchlist_list = request.session.get('watchlist_list', [])

    if request.method == "POST":
        if auction_id in watchlist_list:
            watchlist_list.remove(auction_id)
        else:
            watchlist_list.append(auction_id)

        request.session['watchlist_list'] = watchlist_list

    return render(request, "auctions/listing.html", {
        "listing": listing,
        "comments": comments,
        "watchlist": auction_id in watchlist_list
    })
    
    
@login_required(login_url='login')
def auction_bid(request, auction_id):
    auction = AuctionsList.objects.get(pk=auction_id)
    if request.method == "POST":
        bid_price = int(request.POST.get('bid', 0))
        
        if bid_price > auction.bid:
            bid_instance = Bid.objects.create(auction=auction, price=bid_price)
            bid_instance.save()
            auction.bid = bid_price
            auction.winner = str(request.user)
            auction.save()
        
            
            return HttpResponseRedirect(reverse("listing", args=(auction_id,)))
    

        return render(request, "auctions/listing.html", {
            "listing": auction,
            "message": "Incorrect price"
            })
        
def close_bid(request, auction_id):
    auction = AuctionsList.objects.get(pk=auction_id)
    if request.method == "POST":
        auction.close = True
        auction.save()
        
        
                
        return HttpResponseRedirect(reverse("index"))
    return HttpResponseRedirect(reverse('listing', args=(auction_id,)))

def close(request):
    return render(request, "auctions/close.html",{
        "auctions": AuctionsList.objects.all()
    })

@login_required(login_url='login')
def comments(request, auction_id):
    if request.method == "POST":
        comment = request.POST.get('comment')
        auction = AuctionsList.objects.get(pk=auction_id)
        username = request.user
        comment_instance = Comments(auction=auction,username=username ,comment=comment,)
        comment_instance.save()
        
        return HttpResponseRedirect(reverse('listing', args=(auction_id,)))

@login_required(login_url='login')
def watchlist(request):
    watchlist_list = request.session.get('watchlist_list', [])
    auctions = AuctionsList.objects.filter(pk__in =  watchlist_list)
    
    return render(request, "auctions/watchlist.html",{
        "auctions": auctions
    })
    
def categories(request):
    categories = AuctionsList.objects.values('category').distinct()

    if request.method == "POST":
        category = request.POST.get("category")
        category_auctions = AuctionsList.objects.filter(category=category)
    else:
        category_auctions = []

    return render(request, "auctions/categories.html", {
        "categories": categories,
        "auctions": category_auctions,
    })
