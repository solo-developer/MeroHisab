using MeroHisab.ViewModels;
using MeroHisab.ViewModels.DefaultAccountSetup;
using Rg.Plugins.Popup.Pages;
using Xamarin.Forms.Xaml;

namespace MeroHisab.Partial.ReportFilter
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class DateRangeFilterPopupModal : PopupPage
    {
        public DateRangeFilterPopupModal(DateRangeFilterViewModel model)
        {
            InitializeComponent();
            var vm = App.GetViewModel<DateRangeFilterViewModel>();
            BindingContext = vm;
            vm.SetValues(model);
        }
    }
}