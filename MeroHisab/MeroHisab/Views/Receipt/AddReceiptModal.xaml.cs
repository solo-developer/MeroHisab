using MeroHisab.Core.Dto;
using MeroHisab.ViewModels;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace MeroHisab.Views
{
	[XamlCompilation(XamlCompilationOptions.Compile)]
	public partial class AddReceiptView : ContentPage
	{
		public AddReceiptView()
		{
			InitializeComponent();
			var vm = App.GetViewModel<AddReceiptViewModel>();
			vm.page = this;
			vm.page.BindingContext = vm;
		}
	}
}