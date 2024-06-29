from django.shortcuts import render, redirect
from django import forms
import random
from . import util
from markdown2 import Markdown

markdowner = Markdown()

class NewTitle(forms.Form):
    title = forms.CharField(label="Title")

class NewPage(forms.Form):
    page = forms.CharField(widget=forms.Textarea, label='New Page')
    
class EditPage(forms.Form):
    edit = forms.CharField(widget=forms.Textarea, label='Edit page')
    
def index(request):
    entries = util.list_entries()

    if 'q' in request.GET:
        query = request.GET['q'].lower()

        matching_entries = [entry for entry in entries if query in entry.lower()]
        
        if not matching_entries:
            matching_entries = [entry for entry in entries if all(char in entry.lower() for char in query)]
        
        if not matching_entries:
            return render(request, "encyclopedia/not_found.html")
        
        if len(matching_entries) == 1 and matching_entries[0].lower() == query:
            return redirect("wiki:entries", title=matching_entries[0])
        
        return render(request, "encyclopedia/search.html", {
            "entries": matching_entries,
            "query": query,  
        })

    return render(request, "encyclopedia/index.html", {
        "entries": entries
    })
    
def entries(request, title):
    html = util.get_entry(title)
    html = markdowner.convert(html)
    if html is None:
        return render(request, "encyclopedia/not_found.html")
    return render(request, "encyclopedia/entries.html",{
        "entries": html,
        "title":title
    })
   
def new_page(request):
    if request.method == "POST":
        title_form = NewTitle(request.POST)
        page_form = NewPage(request.POST)
        if title_form.is_valid() and page_form.is_valid():
            new_title = title_form.cleaned_data["title"]
            new_page = page_form.cleaned_data["page"]
            new_title_lower = new_title.lower()
            if any(existing_title.lower() == new_title_lower for existing_title in util.list_entries()):
                return render(request, "encyclopedia/newpage_error.html", {
                    "title" : new_title
                })
            util.save_entry(new_title, new_page)
            return redirect("wiki:entries", title=new_title)
        else:
            return render(request, "encyclopedia/newpage.html",{
            })
    return render(request, "encyclopedia/newpage.html",{
        "NewTitle": NewTitle(),
        "NewPage": NewPage(),
    }) 

    

def edit(request, title):
    html = util.get_entry(title) 
    if request.method == "POST":
        edit_page = EditPage(request.POST)
        if edit_page.is_valid():
            new_edit = edit_page.cleaned_data["edit"]
            util.save_entry(title, new_edit)
            return redirect("wiki:entries", title=title)
    
    return render(request, "encyclopedia/edit.html", {
        "entry": html,
        "title": title,
        "edit_page_form": EditPage(initial={"edit": html})
    })

def random_page(request):
    entries = util.list_entries()

    if entries:
        random_entry = random.choice(entries)
        html = util.get_entry(random_entry)
        html = markdowner.convert(html)
        return render(request, "encyclopedia/entries.html",{
        "entries": html,
        "title":random_entry
    })
    return redirect("wiki:index")