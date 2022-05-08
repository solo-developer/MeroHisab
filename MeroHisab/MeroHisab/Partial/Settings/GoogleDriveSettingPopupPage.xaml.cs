using MeroHisab.ViewModels;
using Rg.Plugins.Popup.Pages;
using Xamarin.Forms.Xaml;

namespace MeroHisab.Partial.Settings
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class GoogleDriveSettingPopupPage : PopupPage
    {
        public GoogleDriveSettingPopupPage()
        {
            InitializeComponent();
            var vm = App.GetViewModel<GoogleDriveSyncViewModel>();
            BindingContext = vm;
        }
    }
}