using MeroHisab.Models;
using System.Collections.Generic;
using Xamarin.CommunityToolkit.ObjectModel;

namespace MeroHisab.ViewModels
{
    public class DashboardHomePageModel : ViewModelBase
    {
        public DashboardHomePageModel()
        {
            Operations = new ObservableRangeCollection<GridItem>();
            this.SetAvailableOperations();
        }
        public GridItem SelectedItem
        {
            get => GetValue<GridItem>();
            set
            {
                SetValue(value);
            }
        }
        public ObservableRangeCollection<GridItem> Operations
        {
            get => GetValue<ObservableRangeCollection<GridItem>>();
            set => SetValue(value);
        }

        private void SetAvailableOperations()
        {
            List<GridItem> availableOperations = new List<GridItem>() {
            new GridItem() { DisplayName = "Payment", IconName = FontAwesome.FontAwesomeIcons.FileInvoice, NavigationViewModelType =null },
            new GridItem() { DisplayName = "Receipt", IconName = FontAwesome.FontAwesomeIcons.Receipt, NavigationViewModelType = null },
            new GridItem() { DisplayName = "Journal", IconName = FontAwesome.FontAwesomeIcons.NotesMedical, NavigationViewModelType = null },
            new GridItem() { DisplayName = "Transfer", IconName = FontAwesome.FontAwesomeIcons.Sync, NavigationViewModelType = null }

            };

            Operations.AddRange(availableOperations);
        }
    }  
}
