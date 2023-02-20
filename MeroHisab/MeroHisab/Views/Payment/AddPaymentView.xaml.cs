using MeroHisab.Core.Dto;
using MeroHisab.ViewModels;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace MeroHisab.Views
{
	[XamlCompilation(XamlCompilationOptions.Compile)]
	public partial class AddPaymentView : ContentPage
	{
		public AddPaymentView()
		{
			InitializeComponent();
			var vm = App.GetViewModel<AddPaymentViewModel>();
			vm.page = this;
			vm.page.BindingContext = vm;
		}
	}
}