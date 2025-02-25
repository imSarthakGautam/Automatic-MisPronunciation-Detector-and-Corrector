from django.db import models

class AudioFile(models.Model):
    file = models.FileField(upload_to='audio/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.file.name

class PracticeSample(models.Model):
    
    text = models.TextField(
        max_length=1000,
        help_text="The full text sample for practice",
    )  # Compulsory: blank=False, null=False by default
    title = models.CharField(
        max_length=200,
        help_text="A short title or description for the sample",
    )  # Compulsory: blank=False, null=False by default
    actual_pronunciation = models.FileField(
        upload_to="pronunciations/actual/",
        blank=True,
        null=True,
        help_text="Optional audio file of the correct pronunciation",
    )  # Optional: blank=True, null=True
    your_pronunciation = models.FileField(
        upload_to="pronunciations/user/",
        blank=True,
        null=True,
        help_text="Optional audio file of the user’s pronunciation",
    )  # Optional: blank=True, null=True
    created_at = models.DateTimeField(
        auto_now_add=True,
        help_text="Timestamp of when the sample was created",
    )  # Compulsory, auto-set on creation
    updated_at = models.DateTimeField(
        auto_now=True,
        help_text="Timestamp of when the sample was last updated",
    )  # Compulsory, auto-updated on save

    def __str__(self):
        return self.title if self.title else self.text[:50] + "..." if len(self.text) > 50 else self.text

    class Meta:
        verbose_name = "Practice Sample"
        verbose_name_plural = "Practice Samples"