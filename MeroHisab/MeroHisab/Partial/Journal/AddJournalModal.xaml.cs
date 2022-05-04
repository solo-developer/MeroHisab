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

namespace MeroHisab.Partial.Journal
{
	[XamlCompilation(XamlCompilationOptions.Compile)]
	public partial class AddJournalModal : PopupPage
	{
		public AddJournalModal(JournalDto dto)
		{
			InitializeComponent();
			var vm = App.GetViewModel<JournalViewModel>();
			vm.page = this;
			vm.page.BindingContext = vm;
			vm.SetValues(dto);
		}
	}
}