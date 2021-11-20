using Rg.Plugins.Popup.Pages;
using System.ComponentModel;
using Xamarin.Forms.Xaml;

namespace MeroHisab.Partial
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class LoadingPopupPage : PopupPage,INotifyPropertyChanged
    {

        private string _text;
        public string Text
        {
            get => _text;
            set
            {
                _text = value;
                OnPropertyChanged();
            }

        }
        public LoadingPopupPage(string text="Loading...")
        {
            InitializeComponent();
            CloseWhenBackgroundIsClicked = false;
            Text = text;
            BindingContext = this;
        }

        protected override bool OnBackButtonPressed()
        {
            return true;
        }
    }
}