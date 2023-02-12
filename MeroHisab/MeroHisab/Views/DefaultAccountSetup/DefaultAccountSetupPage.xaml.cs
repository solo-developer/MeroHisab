using MeroHisab.AttachedBindableProperties;
using MeroHisab.Core.Dto;
using MeroHisab.Core.Enums;
using MeroHisab.Helpers.Interface;
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
        public DefaultAccountSetupPage()
        {
            InitializeComponent();
            BindingContext = App.GetViewModel<DefaultAccountSetupPageModel>();
        }

        private async void ImageButton_Clicked(object sender, System.EventArgs e)
        {
            try
            {
                var btn = (ImageButton)sender;
                var parentGrid = btn.Parent;
                var label = parentGrid.FindByName<Label>("KeyLabel");
                var keyId = CommonAttachedBindableProperties.GetId(label);
                var picker = parentGrid.FindByName<Picker>("LedgerSelector");

                var selectedLedger = picker.SelectedItem as LedgerDto;

                if (selectedLedger == null)
                {
                    await App.Resolve<INotificationService>().ShowInfo("Invalid Input", "Please select a ledger.");
                }
                else
                {
                    (BindingContext as DefaultAccountSetupPageModel).SaveSetup(((LedgerSetupType)keyId).ToString(), selectedLedger.LedgerId.ToString());
                    await App.Resolve<INotificationService>().ShowInfo("Success!!", "Setting saved successfully.");
                }
            }
            catch (System.Exception)
            {
                await App.Resolve<INotificationService>().ShowInfo("Error", "Failed to save setting.");
            }
        }
    }
}