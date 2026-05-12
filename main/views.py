from django.shortcuts import render

from .forms import ContactForm


def home(request):
    form = ContactForm()
    return render(
        request,
        "home.html",
        {
            "contact_form": form,
        },
    )
