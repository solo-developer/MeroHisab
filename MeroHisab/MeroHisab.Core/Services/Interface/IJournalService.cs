using MeroHisab.Core.Dto;

namespace MeroHisab.Core.Services.Interface
{
    public interface IJournalService
    {
        void makeJournalEntries(JournalDto journalDto);
    }
}
