from django.shortcuts import render

# Create your views here.

def pronouncePerfect(request):
    return render(request, 'pronouncePerfect/index.html')
