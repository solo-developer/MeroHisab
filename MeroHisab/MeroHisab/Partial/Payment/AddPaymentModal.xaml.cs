using MeroHisab.Core.Dto;
using MeroHisab.ViewModels;
using Rg.Plugins.Popup.Pages;
using Xamarin.Forms.Xaml;

namespace MeroHisab.Partial.Payment
{
	[XamlCompilation(XamlCompilationOptions.Compile)]
	public partial class AddPaymentModal : PopupPage
	{
		public AddPaymentModal(PaymentDto dto)
		{
			InitializeComponent();
			var vm = App.GetViewModel<PaymentViewModel>();
			vm.page = this;
			vm.page.BindingContext = vm;
			vm.SetValues(dto);
		}
	}
}