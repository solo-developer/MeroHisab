using MeroHisab.Helpers.Interface;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Xamarin.CommunityToolkit.ObjectModel;
using Xamarin.Forms;

namespace MeroHisab.ViewModels
{
    public class DashboardReportsPageModel : ViewModelBase
    {
        public IAsyncCommand ReportsByAccountHeadCommand { get; set; }
        public IAsyncCommand ReceiptsListCommand { get; set; }
        public IAsyncCommand PaymentsListCommand { get; set; }

        private readonly INotificationService _notificationService;
        public DashboardReportsPageModel(INotificationService notificationService)
        {
            _notificationService = notificationService;
            ReportsByAccountHeadCommand = new AsyncCommand(NaviagateToReportsByAccountHeadPage);
            ReceiptsListCommand = new AsyncCommand(NavigateToReceiptsListPage);
            PaymentsListCommand = new AsyncCommand(NavigateToPaymentsListPage);
        }

        private async Task NavigateToPaymentsListPage()
        {
            await _navigationService.NavigateToAsync<PaymentsListPageModel>();
        }

        private async Task NavigateToReceiptsListPage()
        {
           await _navigationService.NavigateToAsync<ReceiptsListPageModel>();
        }

        private async Task NaviagateToReportsByAccountHeadPage()
        {
            await _navigationService.NavigateToAsync<ReportByAccountHeadPageModel>();
        }
    }
}
