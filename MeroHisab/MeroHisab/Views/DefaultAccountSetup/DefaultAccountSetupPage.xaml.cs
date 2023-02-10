using MeroHisab.Core.Dto;
using MeroHisab.ViewModels;
using System.Collections.Generic;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace MeroHisab.Views
{
	[XamlCompilation(XamlCompilationOptions.Compile)]
	public partial class DefaultAccountSetupPage : ContentPage
	{
		public DefaultAccountSetupPage ()
		{
			InitializeComponent();
            BindingContext = App.GetViewModel<DefaultAccountSetupPageModel>();
        }
    }
}