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

    }
}