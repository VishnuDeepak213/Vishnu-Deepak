from django import forms


class ContactForm(forms.Form):
    name = forms.CharField(max_length=80, required=True)
    email = forms.EmailField(required=True)
    subject = forms.CharField(max_length=120, required=True)
    message = forms.CharField(widget=forms.Textarea, required=True)

    @staticmethod
    def _word_count(value: str) -> int:
        return len([word for word in value.strip().split() if word])

    def clean_name(self):
        value = self.cleaned_data["name"].strip()
        if not value:
            raise forms.ValidationError("Name is required.")
        return value

    def clean_email(self):
        value = self.cleaned_data["email"].strip().lower()
        if not value.endswith("@gmail.com"):
            raise forms.ValidationError("Email must end with @gmail.com.")
        return value

    def clean_subject(self):
        value = self.cleaned_data["subject"].strip()
        if not value:
            raise forms.ValidationError("Subject is required.")
        if self._word_count(value) > 7:
            raise forms.ValidationError("Subject must be at most 7 words.")
        return value

    def clean_message(self):
        value = self.cleaned_data["message"].strip()
        if not value:
            raise forms.ValidationError("Message is required.")
        if self._word_count(value) > 15:
            raise forms.ValidationError("Message must be at most 15 words.")
        return value
