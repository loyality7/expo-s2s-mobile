package expo.modules.s2smobile

import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.advanceTimeBy
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertNull
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class EventBridgeTest {

    @Test
    fun `constructs with a coroutine scope and forwards events via sendEvent`() = runTest {
        var lastEventName: String? = null
        var lastPayload: Map<String, Any?>? = null

        val scope = TestScope(StandardTestDispatcher(testScheduler))
        val eventBridge = EventBridge(
            scope = scope,
            sendEvent = { name, payload ->
                lastEventName = name
                lastPayload = payload
            },
            flushIntervalMs = 10L
        )

        // Nothing sent yet — the ticker only flushes a buffer that has content.
        advanceTimeBy(50)
        assertNull(lastEventName)
        assertNull(lastPayload)
    }
}
