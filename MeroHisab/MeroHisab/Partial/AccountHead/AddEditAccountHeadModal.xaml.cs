using MeroHisab.Core.Dto;
using MeroHisab.ViewModels;
using Rg.Plugins.Popup.Pages;
using Xamarin.Forms.Xaml;

namespace MeroHisab.Partial.AccountHead
{
    [XamlCompilation(XamlCompilationOptions.Compile)]
    public partial class AddEditAccountHeadModal : PopupPage
    {
        public AddEditAccountHeadModal(AccountHeadDto dto)
        {
            InitializeComponent();
            var vm= App.GetViewModel<AccountHeadViewModel>();
            BindingContext = vm;
            vm.SetValues(dto);
        }
    }
}