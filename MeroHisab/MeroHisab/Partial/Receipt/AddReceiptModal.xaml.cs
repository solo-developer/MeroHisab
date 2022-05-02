using MeroHisab.Core.Dto;
using MeroHisab.ViewModels;
using Rg.Plugins.Popup.Pages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace MeroHisab.Partial.Receipt
{
	[XamlCompilation(XamlCompilationOptions.Compile)]
	public partial class AddReceiptModal : PopupPage
	{
		public AddReceiptModal(ReceiptDto dto)
		{
			InitializeComponent();
			var vm = App.GetViewModel<ReceiptViewModel>();
			vm.page = this;
			vm.page.BindingContext = vm;
			vm.SetValues(dto);
		}
	}
}