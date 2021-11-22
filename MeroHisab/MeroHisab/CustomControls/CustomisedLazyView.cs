using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.UI.Views;
using Xamarin.Forms;

namespace MeroHisab.CustomControls
{
    public abstract class CustomisedLazyView : BaseLazyView
    {
        public static readonly BindableProperty AccentColorProperty = BindableProperty.Create(
            nameof(AccentColor),
            typeof(Color),
            typeof(CustomisedLazyView),
            Color.Accent,
            propertyChanged: AccentColorChanged
            );

        private static void AccentColorChanged(BindableObject bindable, object oldValue, object newValue)
        {
            var lazyView = bindable as CustomisedLazyView;
            if (lazyView.Content is ActivityIndicator activityIndicator)
                activityIndicator.Color = (Color)newValue;
        }

        public static readonly BindableProperty UseActivityIndicatorProperty = BindableProperty.Create(
           nameof(UseActivityIndicator),
           typeof(bool),
           typeof(CustomisedLazyView),
           false,
           propertyChanged: UseActivityIndicatorChanged
           );

        private static void UseActivityIndicatorChanged(BindableObject bindable, object oldValue, object newValue)
        {
            var lazyView = bindable as CustomisedLazyView;
            bool useActivityIndicator = (bool)newValue;
            if (useActivityIndicator)
            {
                lazyView.Content = new ActivityIndicator()
                {
                    Color = lazyView.AccentColor,
                    HorizontalOptions = LayoutOptions.Center,
                    VerticalOptions = LayoutOptions.Center,
                    IsRunning = true
                };
            }
        }

        public static readonly BindableProperty AnimateProperty = BindableProperty.Create(
           nameof(Animate),
           typeof(bool),
           typeof(CustomisedLazyView),
           false
           );

        public Color AccentColor
        {
            get => (Color)GetValue(AccentColorProperty);
            set => SetValue(AccentColorProperty, value);
        }

        public bool UseActivityIndicator
        {
            get => (bool)GetValue(UseActivityIndicatorProperty);
            set => SetValue(UseActivityIndicatorProperty, value);
        }

        public bool Animate
        {
            get => (bool)GetValue(AnimateProperty);
            set => SetValue(AnimateProperty, value);
        }

        protected override void OnBindingContextChanged()
        {
            if (Content != null && !(Content is ActivityIndicator))
            {
                Content.BindingContext = BindingContext;
            }
        }
    }

    public class CustomisedLazyViewImpl<TView> : CustomisedLazyView where TView : View, new()
    {
        public override async ValueTask LoadViewAsync()
        {
            SetIsLoaded(true);
            View view = new TView { BindingContext = BindingContext };
            Content = view;           
        }
    }
}
