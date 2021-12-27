using MeroHisab.Library;
using MeroHisab.ViewModels;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace MeroHisab.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class AccountHeadListPage : ContentPage
    {
        public AccountHeadListPage()
        {
            InitializeComponent();
            BindingContext = App.GetViewModel<AccountHeadListPageModel>();
           // ((NavigationPage)Application.Current.MainPage).BarBackgroundColor = Constants.BackgroundColor;
        }
    }
}