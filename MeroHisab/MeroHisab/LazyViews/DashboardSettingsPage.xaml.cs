using MeroHisab.ViewModels;

using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace MeroHisab.LazyViews
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class DashboardSettingsPage : ContentView
    {
        public DashboardSettingsPage()
        {
            InitializeComponent();
            Content.BindingContext = App.GetViewModel<DashboardSettingsPageModel>();
            (Content.BindingContext as DashboardSettingsPageModel).InitSettingsPageLoad();
        }

        protected override void OnBindingContextChanged()
        {
            base.OnBindingContextChanged();
        }

        private async void TapGestureRecognizer_Tapped(object sender, System.EventArgs e)
        {
            await (Content.BindingContext as DashboardSettingsPageModel).NavigateToAccountHeadListPage();
        }

        private async void ViewAllPaymentMediumsTapped(object sender, System.EventArgs e)
        {
            await(Content.BindingContext as DashboardSettingsPageModel).NavigateToPaymentMediumListPage();
        }
    }
}