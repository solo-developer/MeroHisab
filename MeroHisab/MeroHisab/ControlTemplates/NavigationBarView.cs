
using Xamarin.Forms;

namespace MeroHisab.ControlTemplates
{
    public class NavigationBarView : ContentView
    {
        public static readonly BindableProperty TitleProperty = BindableProperty.Create(nameof(Title), typeof(string), typeof(NavigationBarView), string.Empty);
      

        public string Title
        {
            get => (string)GetValue(TitleProperty);
            set => SetValue(TitleProperty, value);
        }
    }
}