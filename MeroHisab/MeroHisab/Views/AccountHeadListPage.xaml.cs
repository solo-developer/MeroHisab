using MeroHisab.Core.Dto;
using MeroHisab.Library;
using MeroHisab.ViewModels;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace MeroHisab.Views
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class AccountHeadListPage : CustomControls.BackButtonEventOverrideableContentPage
    {
        public AccountHeadListPage()
        {
            InitializeComponent();
            BindingContext = App.GetViewModel<AccountHeadListPageModel>();
            // ((NavigationPage)Application.Current.MainPage).BarBackgroundColor = Constants.BackgroundColor;

            this.CustomBackButtonAction = async () =>
            {
                string key = "AccountHeadListPage.BackButtonPressed";
                MessagingCenter.Send(new AccountHeadDto(), key);

            };
        }
    }
}