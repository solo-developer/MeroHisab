using MeroHisab.ViewModels.DefaultAccountSetup;
using System;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MeroHisab.ViewModels
{
    public class DateRangeFilterViewModel : ViewModelBase
    {
        public IAsyncCommand ApplyFilterButtonClicked { get; set; }
        public DateRangeFilterViewModel()
        {
            FromDate= DateTime.Now.AddDays(-15);
            ToDate = DateTime.Now;
            ApplyFilterButtonClicked = new AsyncCommand(OnApplyFilterButtonClicked);
        }
        public DateTime FromDate {
            get => GetValue<DateTime>();
            set => SetValue(value);
        }
        public DateTime ToDate {
            get => GetValue<DateTime>();
            set => SetValue(value);
        }

        private async Task OnApplyFilterButtonClicked()
        {
            string key = "DateRangeFilterPopupPage.ApplyFilterButtonPressed";
            MessagingCenter.Send(new DateRangeFilterViewModel() { FromDate=this.FromDate,ToDate=this.ToDate}, key);
            await _navigationService.HideModal();
        }

        public void SetValues(DateRangeFilterViewModel model)
        {
            
            this.FromDate = model.FromDate;
            this.ToDate = model.ToDate;
        }
    }
}
