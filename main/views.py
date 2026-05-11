from pathlib import Path

from django.conf import settings
from django.shortcuts import render
from django.utils import timezone

from .forms import ContactForm


def home(request):
    form = ContactForm()
    submitted = False

    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            payload = form.cleaned_data
            submission_line = (
                f"[{timezone.now().isoformat()}] "
                f"name={payload['name']} | email={payload['email']} | "
                f"subject={payload['subject']} | message={payload['message']}\n"
            )
            output_path = Path(settings.BASE_DIR) / "contact_submissions.txt"
            with output_path.open("a", encoding="utf-8") as handle:
                handle.write(submission_line)

            submitted = True
            form = ContactForm()

    return render(
        request,
        "home.html",
        {
            "contact_form": form,
            "contact_submitted": submitted,
        },
    )
