using MeroHisab.Models;
using System.Collections.Generic;
using Xamarin.CommunityToolkit.ObjectModel;

namespace MeroHisab.ViewModels
{
    public class DashboardProfilePageModel : ViewModelBase
    {
        public DashboardProfilePageModel()
        {
            GeneralOptions = new ObservableRangeCollection<GridItem>();
            AccountOptions = new ObservableRangeCollection<GridItem>();
            AboutOptions = new ObservableRangeCollection<GridItem>();
            this.SetGeneralOptions();
            this.SetAccountOptions();
            this.SetAboutOptions();
        }
        public int SelectedViewModelIndex
        {
            get => GetValue<int>();
            set
            {
                SetValue(value);
            }
        }

        public GridItem SelectedItem
        {
            get => GetValue<GridItem>();
            set
            {
                SetValue(value);
            }
        }
        public ObservableRangeCollection<GridItem> GeneralOptions
        {
            get => GetValue<ObservableRangeCollection<GridItem>>();
            set => SetValue(value);
        }
        
        public ObservableRangeCollection<GridItem> AccountOptions
        {
            get => GetValue<ObservableRangeCollection<GridItem>>();
            set => SetValue(value);
        }
        
        public ObservableRangeCollection<GridItem> AboutOptions
        {
            get => GetValue<ObservableRangeCollection<GridItem>>();
            set => SetValue(value);
        }

        private void SetGeneralOptions()
        {
            List<GridItem> availableOperations = new List<GridItem>() {
            new GridItem() { DisplayName = "Accounts", IconName = FontAwesome.FontAwesomeIcons.FileInvoice, NavigationViewModelType =null },
            new GridItem() { DisplayName = "Credit Card", IconName = FontAwesome.FontAwesomeIcons.Receipt, NavigationViewModelType = null },
            new GridItem() { DisplayName = "Categories", IconName = FontAwesome.FontAwesomeIcons.NotesMedical, NavigationViewModelType = null },
            new GridItem() { DisplayName = "Tags", IconName = FontAwesome.FontAwesomeIcons.Sync, NavigationViewModelType = null },
            new GridItem() { DisplayName = "Goals", IconName = FontAwesome.FontAwesomeIcons.Sync, NavigationViewModelType = null },
            new GridItem() { DisplayName = "Import Data", IconName = FontAwesome.FontAwesomeIcons.Sync, NavigationViewModelType = null },
            new GridItem() { DisplayName = "Export Reports", IconName = FontAwesome.FontAwesomeIcons.Sync, NavigationViewModelType = null },
            new GridItem() { DisplayName = "Manage Dashboard", IconName = FontAwesome.FontAwesomeIcons.Sync, NavigationViewModelType = null },

            };

            GeneralOptions.AddRange(availableOperations);
        }
        
        private void SetAccountOptions()
        {
            List<GridItem> availableOperations = new List<GridItem>() {
            new GridItem() { DisplayName = "Charts", IconName = FontAwesome.FontAwesomeIcons.FileInvoice, NavigationViewModelType =null },
            new GridItem() { DisplayName = "My Performance", IconName = FontAwesome.FontAwesomeIcons.Receipt, NavigationViewModelType = null },
            new GridItem() { DisplayName = "Monthly Balance", IconName = FontAwesome.FontAwesomeIcons.NotesMedical, NavigationViewModelType = null },
            new GridItem() { DisplayName = "Calendar", IconName = FontAwesome.FontAwesomeIcons.Sync, NavigationViewModelType = null },
            new GridItem() { DisplayName = "Expenses by Location", IconName = FontAwesome.FontAwesomeIcons.Sync, NavigationViewModelType = null },

            };

            AccountOptions.AddRange(availableOperations);
        }
        
        private void SetAboutOptions()
        {
            List<GridItem> availableOperations = new List<GridItem>() {
            new GridItem() { DisplayName = "Rate Us", IconName = FontAwesome.FontAwesomeIcons.FileInvoice, NavigationViewModelType =null },
            new GridItem() { DisplayName = "Terms of Use", IconName = FontAwesome.FontAwesomeIcons.Receipt, NavigationViewModelType = null },
            new GridItem() { DisplayName = "Help Center", IconName = FontAwesome.FontAwesomeIcons.NotesMedical, NavigationViewModelType = null },
            new GridItem() { DisplayName = "About", IconName = FontAwesome.FontAwesomeIcons.Sync, NavigationViewModelType = null },
            };

            AboutOptions.AddRange(availableOperations);
        }
    }
}
